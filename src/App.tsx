import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { BigNumber, Contract, ContractTransaction, ethers } from "ethers";
import { encrypt } from "@metamask/eth-sig-util";
import "./App.scss";
import dmail from "./contractData/dmail";
import Setup from "./components/Setup";
import ConnectButton from "./components/ConnectButton";
import MailsList, { MailItem } from "./components/MailsList";
import MailsView from "./components/MailsView";
import NewMail from "./components/NewMail";

function App() {
	const [isRegistared, setIsRegistared] = useState(false);
	const [account, setAccount] = useState<string | null>(null);
	const [pubKey, setPubKey] = useState<string>();
	const [contract, setContract] = useState<ethers.Contract>();
	const [networkId, setNetworkId] = useState(0);
	const [selectedMail, setSelectedMail] = useState<MailItem>();

	const init = async () => {
		const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
		let network = await provider.getNetwork();
		if (network && networkId !== network.chainId) {
			setNetworkId(network.chainId);
		}
	};

	const sendMail = async (to: string, body: string) => {
		// console.log(msg);
		if (contract) {
			let transaction: ContractTransaction = await contract["send"](to, body);
			await transaction.wait(1);
		}
	};
	useEffect(() => {
		init();
	});
	useEffect(() => {
		if (networkId != 0) {
			if (networkId == dmail.chainId) {
				const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
				const cont = new ethers.Contract(dmail.address, dmail.abi, provider.getSigner());
				setContract(cont);
			}
		}
	}, [networkId]);

	return (
		<div
			className="App"
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
			}}
		>
			<div
				className="navbar"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					display: "flex",
					padding: "1rem 2rem",
				}}
			>
				<div
					className="logo"
					style={{
						fontSize: "2rem",
						fontWeight: "bold",
					}}
				>
					DMail
				</div>
				<div className="spacer" style={{ flexGrow: 1 }}></div>
				<div className="buttons">
					<ConnectButton onAccountChange={(account) => setAccount(account)}></ConnectButton>
				</div>
			</div>

			{isRegistared ? (
				<>
					<div
						className="mailbox"
						style={{
							display: "grid",
							gridTemplateColumns: "350px 1fr 1fr",
							gap: "1rem",
							flexGrow: 1,
						}}
					>
						<MailsList
							contract={contract as Contract}
							account={account as string}
							onSelect={(mail) => {
								console.log("mail Selected");

								setSelectedMail(() => mail);
							}}
						></MailsList>
						<MailsView item={selectedMail} account={account || ""}></MailsView>
						<NewMail
							to={null}
							OnSend={(data, to) => {
								return sendMail(to, data);
							}}
							pubKey={pubKey || ""}
						></NewMail>
					</div>
				</>
			) : (
				<>
					<Setup
						account={account}
						pubKey={pubKey}
						contract={contract}
						onAccountChange={(value) => {
							setAccount(value);
						}}
						onPubKeyChange={(value) => {
							setPubKey(value);
						}}
						onRegisterChange={(value) => {
							setIsRegistared(value);
						}}
					></Setup>
				</>
			)}
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</div>
	);
}

export default App;
