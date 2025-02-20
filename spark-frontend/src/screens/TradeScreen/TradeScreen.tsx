import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES } from "@components/Text";
import BottomTables from "@screens/TradeScreen/BottomTables";
import Chart from "@screens/TradeScreen/Chart";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import StatusBar from "@screens/TradeScreen/StatusBar";
import { Column } from "@src/components/Flex";
import useWindowSize from "@src/hooks/useWindowSize";
import LeftBlock from "@src/screens/TradeScreen/LeftBlock";
import { CreateOrderSpotVMProvider } from "@src/screens/TradeScreen/LeftBlock/CreateOrderSpot/CreateOrderSpotVM";
import { useStores } from "@stores";

import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  flex: 1;
  box-sizing: border-box;
  padding: 0 12px;
  gap: 4px;
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 280px) minmax(300px, 1fr) minmax(100px, 280px);
  width: 100%;
  height: 100%;
  gap: 4px;
`;

const TradeScreenImpl: React.FC<IProps> = observer(() => {
  const width = useWindowSize().width;
  const { tradeStore } = useStores();

  useEffect(() => {
    document.title = `Spark | ${tradeStore.marketSymbol}`;
  }, [tradeStore.marketSymbol]);

  const isMobile = width && width < 880;

  if (isMobile) {
    return (
      <Root>
        <Text type={TEXT_TYPES.BUTTON_SECONDARY}>Page under construction. Please use a desktop device.</Text>
      </Root>
    );
  }

  return (
    <Root>
      <MarketStatisticsBar />
      <ContentContainer>
        <LeftBlock />
        <Column crossAxisSize="max" mainAxisSize="stretch" style={{ flex: 5 }}>
          <Chart />
          <BottomTables />
        </Column>
        <OrderbookAndTradesInterface />
      </ContentContainer>
      <StatusBar />
    </Root>
  );
});

const TradeScreen: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();
  const spotMarketExists = tradeStore.spotMarkets.some((market) => market.symbol === marketId);
  tradeStore.setMarketSymbol(!marketId || !spotMarketExists ? tradeStore.defaultMarketSymbol : marketId);

  return (
    //я оборачиваю весь TradeScreenImpl в CreateOrderSpotVMProvider потому что при нажатии на трейд в OrderbookAndTradesInterface должно меняться значение в LeftBlock
    <CreateOrderSpotVMProvider>
      <TradeScreenImpl />
    </CreateOrderSpotVMProvider>
  );
});
export default TradeScreen;
