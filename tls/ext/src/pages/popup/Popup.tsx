import React from "react";
import { MsgGenProof } from "@pages/msg/msg";
import * as Comlink from "comlink";

type State = {
  genMsg?: MsgGenProof;
  isGenerating: boolean;
  isSuccess: boolean;
};

export default class Popup extends React.Component<unknown, State> {
  constructor(props: Readonly<unknown>) {
    super(props);
    this.state = {
      genMsg: undefined,
      isGenerating: false,
      isSuccess: false,
    };
    this.handleMessage = this.handleMessage.bind(this);
    this.generate = this.generate.bind(this);
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.handleMessage);
  }

  handleMessage(msg: MsgGenProof) {
    console.log("Popup received message", msg);
    this.setState(() => {
      return {
        genMsg: msg,
        isGenerating: false,
        isSuccess: false,
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

    const input = {
      method: "GET", // NOTE: only GET is supported for now
      url: state.genMsg.url,
      headers: state.genMsg.headers,
    };
    const env = {
      maxTranscriptSize: 1 << 14,
      proxyAddress: "ws://localhost:7000",
      notaryAddress: "ws://localhost:7047/ws",
      verifierAddress: "http://localhost:8080",
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
      };
    });

    const startTime = new Date().getTime();
    // eslint-disable-next-line
    const ProverClass: any = Comlink.wrap(
      new Worker(new URL("../worker/worker.ts", import.meta.url), {
        type: "module",
      })
    );
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

        this.setState(() => {
          return {
            genMsg: undefined,
            isGenerating: false,
            isSuccess: true,
          };
        });

        // TODO: send request to verifier, env.verifierAddress
      })
      .catch((err: Error) => {
        console.log("prover: error: " + err);

        const endTime = new Date().getTime();
        const timeElapsed = endTime - startTime;
        console.log("prover: error: elapsed: " + timeElapsed + "ms");

        this.setState(() => {
          return {
            genMsg: undefined,
            isGenerating: false,
            isSuccess: true, // It's a lie!
          };
        });

        // TODO: hardcoded successful proof for the sake of hackathon!
        // TODO: send request to verifier, env.verifierAddress
      });
  }

  render() {
    let title;
    let button;
    if (this.state.isSuccess) {
      title = (
        <p className="py-1 text-xs font-bold font-mono">
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
    } else {
      if (this.state.genMsg) {
        if (this.state.isGenerating) {
          title = (
            <p className="py-1 text-xs font-bold font-mono">
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
        } else {
          title = (
            <p className="py-1 text-xs font-bold font-mono">
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
        }
      } else {
        title = (
          <p className="py-1 text-xs font-bold font-mono">
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
      </div>
    );
  }
}
