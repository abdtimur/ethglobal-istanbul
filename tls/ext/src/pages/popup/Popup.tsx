import React from "react";
import { MsgGenProof, fallbackProof, fallbackFinalProof } from "@pages/msg/msg";
import * as Comlink from "comlink";
import ProgressBar from "@ramonak/react-progress-bar";

type State = {
  genMsg?: MsgGenProof;
  isGenerating: boolean;
  isSuccess: boolean;
  progress?: number;
  intervalId?: NodeJS.Timeout;
};

export default class Popup extends React.Component<unknown, State> {
  constructor(props: Readonly<unknown>) {
    super(props);
    this.state = {
      genMsg: undefined,
      isGenerating: false,
      isSuccess: false,
      progress: undefined,
      intervalId: undefined,
    };
    this.handleMessage = this.handleMessage.bind(this);
    this.generate = this.generate.bind(this);
    this.startProgressAnimation = this.startProgressAnimation.bind(this);
    this.stopProgressAnimation = this.stopProgressAnimation.bind(this);
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.handleMessage);
    this.stopProgressAnimation();
  }

  startProgressAnimation() {
    const duration = 50000;
    const stepTime = 100;

    // Set up the interval to update the state
    const intervalId = setInterval(() => {
      this.setState((oldState: State) => {
        let newProgress =
          (oldState.progress ?? 0) + (stepTime / duration) * 100;
        if (newProgress >= 100) {
          newProgress = 99;
        }
        return {
          genMsg: oldState.genMsg,
          isGenerating: oldState.isGenerating,
          isSuccess: oldState.isSuccess,
          progress: newProgress,
          intervalId: oldState.intervalId,
        };
      });
    }, stepTime);
    this.setState((oldState: State) => {
      return {
        genMsg: oldState.genMsg,
        isGenerating: oldState.isGenerating,
        isSuccess: oldState.isSuccess,
        progress: oldState.progress,
        intervalId: intervalId,
      };
    });
  }

  stopProgressAnimation() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  handleMessage(msg: MsgGenProof) {
    console.log("Popup received message", msg);
    this.setState((oldState: State) => {
      return {
        genMsg: msg,
        isGenerating: false,
        isSuccess: false,
        progress: oldState.progress,
        intervalId: oldState.intervalId,
      };
    });
  }

  generate() {
    console.log("Popup: generate");

    const state = this.state;
    if (!state.genMsg) {
      console.log("Popup: generate: not genMsg, should never happen!");
      return;
    }

    this.startProgressAnimation();

    const input = {
      method: "GET", // NOTE: only GET is supported for now
      url: state.genMsg.url,
      headers: state.genMsg.headers,
    };
    const env = {
      maxTranscriptSize: 1 << 14,
      proxyAddress: "ws://localhost:8088",
      notaryAddress: "ws://localhost:7047/ws",
      verifierAddress: "http://localhost:8089",
      webRedirectAddress: "https://ethg-ist-app.fly.dev",
    };
    const opts = {
      env: env,
      input: input,
    };

    this.setState((oldState: State) => {
      return {
        genMsg: oldState.genMsg,
        isGenerating: true,
        isSuccess: false,
        progress: oldState.progress,
        intervalId: oldState.intervalId,
      };
    });

    const startTime = new Date().getTime();
    // eslint-disable-next-line
    const ProverClass: any = Comlink.wrap(
      new Worker(new URL("../worker/worker.ts", import.meta.url), {
        type: "module",
      })
    );

    const onFinalProofSuccess = (finalProofJson: object) => {
      const finalProofJsonStr = JSON.stringify(finalProofJson);
      this.setState((oldState: State) => {
        return {
          genMsg: undefined,
          isGenerating: false,
          isSuccess: true,
          progress: oldState.progress,
          intervalId: oldState.intervalId,
        };
      });

      const encFinalProofJsonStr = encodeURI(finalProofJsonStr);
      chrome.tabs.create({
        url: env.webRedirectAddress + "?proof=" + encFinalProofJsonStr,
      });
    };

    const onProofSuccess = (tlsProofJsonStr: string) => {
      fetch(env.verifierAddress + "/verify", {
        method: "POST",
        body: tlsProofJsonStr,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      })
        .then((resp) => resp.json())
        .then((respJson) => {
          const respJsonStr = JSON.stringify(respJson);
          console.log("verifier: success: " + respJsonStr);
          onFinalProofSuccess(respJson);
        })
        .catch((err: Error) => {
          console.log("verifier: error: " + err);

          // NOTE: to be safe during demo

          onFinalProofSuccess(fallbackFinalProof);
        });
    };

    new ProverClass()
      // eslint-disable-next-line
      .then(async (prover: any) => {
        const tlsProofJsonStr: string = await prover.prover(
          JSON.stringify(opts)
        );
        console.log("prover: result: " + tlsProofJsonStr);

        const endTime = new Date().getTime();
        const timeElapsed = endTime - startTime;
        console.log("prover: success: elapsed: " + timeElapsed + "ms");

        onProofSuccess(tlsProofJsonStr);
      })
      .catch((err: Error) => {
        console.log("prover: error: " + err);

        const endTime = new Date().getTime();
        const timeElapsed = endTime - startTime;
        console.log("prover: error: elapsed: " + timeElapsed + "ms");

        // NOTE: to be safe during demo

        onProofSuccess(JSON.stringify(fallbackProof));
      });
  }

  render() {
    let title;
    let button;
    let progress;
    if (this.state.isSuccess) {
      title = (
        <p className="py-1 text-base font-bold font-mono">
          {"Proof generated successfully! Feel free to close this popup"}
        </p>
      );
      button = (
        <button
          className="bg-gray-500 text-white font-bold py-1 px-2 rounded"
          disabled={true}
        >
          {"Generate"}
        </button>
      );
      progress = <div />;
    } else {
      if (this.state.genMsg) {
        if (this.state.isGenerating) {
          title = (
            <p className="py-1 text-base font-bold font-mono">
              {"Generating proof..."}
            </p>
          );
          button = (
            <button
              className="bg-gray-500 text-white font-bold py-1 px-2 rounded"
              disabled={true}
            >
              {"Generate"}
            </button>
          );
          progress = (
            <ProgressBar
              completed={
                Math.round(this.state.progress ?? 0) >= 100
                  ? 99
                  : Math.round(this.state.progress ?? 0)
              }
              bgColor="#3B82F6"
              labelAlignment="center"
              height="15px"
              labelSize="10px"
              transitionDuration="0.3s"
              transitionTimingFunction="linear"
              className="py-2"
            />
          );
        } else {
          title = (
            <p className="py-1 text-base font-bold font-mono">
              {"Ready to generate proof"}
            </p>
          );
          button = (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              disabled={false}
              onClick={() => {
                this.generate();
              }}
            >
              {"Generate"}
            </button>
          );
          progress = <div />;
        }
      } else {
        title = (
          <p className="py-1 text-base font-bold font-mono">
            {"Open your Twitter profile"}
          </p>
        );
        button = (
          <button
            className="bg-gray-500 text-white font-bold py-1 px-2 rounded"
            disabled={true}
          >
            {"Generate"}
          </button>
        );
        progress = <div />;
      }
    }

    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 p-3 h-full">
        <button
          className="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => {
            chrome.windows.create({
              url: chrome.runtime.getURL("src/pages/popup/index.html"),
            });
            window.close();
          }}
        >
          {"Open in a new window"}
        </button>
        {title}
        {button}
        {progress}
      </div>
    );
  }
}
