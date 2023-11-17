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
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.handleMessage);
  }

  handleMessage(msg: MsgGenProof) {
    console.log("Popup received message", msg);
  }

  render() {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 p-3 h-full">
        <p className="py-1 text-xs font-bold font-mono">{"Hello, world!"}</p>
      </div>
    );
  }
}
