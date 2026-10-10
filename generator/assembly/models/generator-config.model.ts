import {
  DEFAULT_INSTRUMENT_LENGTH,
  DEFAULT_MAX_INSTRUMENT_CENT_PRICE,
  DEFAULT_MAX_NEXT_SPREAD,
  DEFAULT_MAX_PERCENT_DIFF,
  DEFAULT_MAX_TRADE_QUANTITY,
  DEFAULT_MIN_INSTRUMENT_CENT_PRICE,
  DEFAULT_MIN_NEXT_SPREAD,
  DEFAULT_MIN_TRADE_QUANTITY,
} from '../constants';

@final
export class GeneratorConfig {
  constructor(
    public readonly instrumentCount: i32,
    public readonly seed: i32,
    public readonly maxPercentDiff: i8 = <i8>DEFAULT_MAX_PERCENT_DIFF,
    public readonly minInstrumentCentPrice: i32 = DEFAULT_MIN_INSTRUMENT_CENT_PRICE,
    public readonly maxInstrumentCentPrice: i32 = DEFAULT_MAX_INSTRUMENT_CENT_PRICE,
    public readonly instrumentLength: i8 = <i8>DEFAULT_INSTRUMENT_LENGTH,
    public readonly minNextSpread: i32 = DEFAULT_MIN_NEXT_SPREAD,
    public readonly maxNextSpread: i32 = DEFAULT_MAX_NEXT_SPREAD,
    public readonly minTradeQuantity: i32 = DEFAULT_MIN_TRADE_QUANTITY,
    public readonly maxTradeQuantity: i32 = DEFAULT_MAX_TRADE_QUANTITY,
  ) {}
}
