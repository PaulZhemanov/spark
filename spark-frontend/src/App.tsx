import React from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import { Route, Routes } from "react-router-dom";
import { observer } from "mobx-react";
import TradeScreen from "@screens/TradeScreen";
import Header from "@components/Header";

const Root = styled(Column)`
	width: 100%;
	min-width: 1080px;
	align-items: center;
	background: ${({ theme }) => theme.colors.gray5};
	height: 100vh;
	max-height: 100vh;
`;

const App: React.FC = observer(() => {
	return (
		<Root>
			<Header />
			<Routes>
				<Route path="*" element={<TradeScreen />} />
				{/*<Route path={ROUTES.FAUCET} element={<Faucet />} />*/}
			</Routes>
		</Root>
	);
});

export default App;
