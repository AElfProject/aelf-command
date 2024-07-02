export default Logger;
declare class Logger {
  constructor(props: { [key: string]: any });
  symbol: string;
  name: string;
  log: boolean;
}
