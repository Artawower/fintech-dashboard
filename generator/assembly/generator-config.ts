@final
export class GeneratorConfig {
  constructor(
    public readonly instrumentCount: i32,
    public readonly maxPercentDiff: i8 = 15,
    public readonly seed: i32 = 0,
    public readonly minInstrumentCentPrice: i32 = 1,
    public readonly maxInstrumentCentPrice: i32 = 400000,
    public readonly instrumentLength: i8 = 4,
    public readonly minNextSpread: i32 = 0,
    public readonly maxNextSpread: i32 = 15,
  ) {}
}
