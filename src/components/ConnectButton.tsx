import { styled } from "@stitches/react";
import { ethers } from "ethers";
import React, { PropsWithChildren, useEffect, useState } from "react";

interface Props {
	onAccountChange: (account: string) => void;
}

export default function ConnectButton(props: PropsWithChildren<Props>) {
	const [account, setAccount] = useState<string>();
	const init = async () => {
		const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
		const accounts = await provider.listAccounts();
		if (accounts.length > 0) connect();
	};
	useEffect(() => {
		init();
	});
	const connect = async () => {
		const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
		let addresses = await provider.send("eth_requestAccounts", []);
		if (addresses[0] != account) {
			props.onAccountChange(addresses[0]);
			setAccount(addresses[0]);
		}
	};
	return (
		<button onClick={() => connect()} disabled={account != null}>
			{account ? account : "Connect"}
		</button>
	);
}
