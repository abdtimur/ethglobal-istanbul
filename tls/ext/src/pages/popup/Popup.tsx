import React from "react";

export default class Popup extends React.Component<unknown, State> {
  constructor(props: Readonly<unknown>) {
    super(props);
  }

  render() {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 p-3 h-full">
        <p className="py-1 text-xs font-bold font-mono">{"Hello, world!"}</p>
      </div>
    );
  }
}
