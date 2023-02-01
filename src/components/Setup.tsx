import React, { PropsWithChildren, useEffect } from "react";
import { Contract, ContractTransaction, ethers } from "ethers";

interface Props {
	account?: string | null;
	pubKey?: string | null;
	contract?: Contract | null;
	onAccountChange: (account: string) => void;
	onRegisterChange: (isRegistared: boolean) => void;
	onPubKeyChange: (pubKey: string) => void;
}

export default function Setup(props: PropsWithChildren<Props>) {
	useEffect(() => {
		if (props.contract) getPublicKey();
	});

	const generatePubKey = async () => {
		if (window.ethereum.request && props.account) {
			let key = await window.ethereum.request({
				method: "eth_getEncryptionPublicKey",
				params: [props.account],
			});
			props.onPubKeyChange(key);
		}
	};
	const getPublicKey = async () => {
		if (props.contract) {
			let result = await props.contract["getKey"](props.account);
			if (result) {
				props.onPubKeyChange(result);
				props.onRegisterChange(true);
			}
		}
	};
	const register = async (key: string) => {
		if (props.contract) {
			let transaction: ContractTransaction = await props.contract["setKey"](key);
			await transaction.wait(1);
			props.onRegisterChange(true);
		}
	};

	return (
		<>
			<h1>DMail- A decentralized mail protocall </h1>
			<div className="col">
				{props.account ? (
					<>
						<div className="card">
							{props.pubKey ? (
								<>
									<p>PubKey: {props.pubKey}</p>
								</>
							) : (
								<p>
									<button onClick={() => generatePubKey()}>Get Mail ID</button>
								</p>
							)}
						</div>
					</>
				) : (
					<>
						<div className="card">
							<p>PubKey: {props.pubKey}</p>
						</div>
					</>
				)}
				{props.pubKey ? (
					<div className="card">
						<button onClick={() => register(props.pubKey || "")}>Register Public Key</button>
					</div>
				) : (
					<></>
				)}
			</div>
		</>
	);
}
