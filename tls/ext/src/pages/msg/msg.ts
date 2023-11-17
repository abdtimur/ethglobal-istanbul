export type Header = {
  name: string;
  value: string;
};

export type MsgGenProof = {
  url: string;
  headers: Header[];
};
