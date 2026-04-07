interface Options {
  from?: Date;
  to?: Date;
}

export default class RangePicker {
  constructor({ from = new Date(), to = new Date() }: Options = {}) {}
}
