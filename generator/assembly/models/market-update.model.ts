export class MarketUpdate {
  public instrument: string = '';
  public lastPriceCents: i32 = 0;
  public time: i64 = 0;
  public priceCents: i32 = 0;
  public tradeQuantity: i32 = 0;
  public bidCents: i32 = 0;
  public askCents: i32 = 0;
  public bidQuantity: i32 = 0;
  public askQuantity: i32 = 0;
}
