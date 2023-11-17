import React from "react";
import { MsgGenProof } from "@pages/msg/msg";

type State = {
  genMsg?: MsgGenProof;
  isGenerating: boolean;
};

export default class Popup extends React.Component<unknown, State> {
  constructor(props: Readonly<unknown>) {
    super(props);
    this.state = {
      genMsg: undefined,
      isGenerating: false,
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
      };
    });
  }

  generate() {
    console.log("Popup: generate");
    this.setState((oldState: State) => {
      return {
        genMsg: oldState.genMsg,
        isGenerating: true,
      };
    });

    // TODO:
  }

  render() {
    let title;
    let button;
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
