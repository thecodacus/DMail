import { styled } from "@stitches/react";
import { BigNumber, Contract, ethers } from "ethers";
import React, { useEffect, useState } from "react";

const MailListItem = styled("div", {
	overflow: "hidden",
	whiteSpace: "nowrap",
	display: "block",
	padding: "10px",
	transition: "200ms",
	borderRadius: "0.5rem",
	["&:hover"]: {
		color: "Gray",
		backgroundColor: "White",
		cursor: "pointer",
	},
});

export interface MailItem {
	id: number;
	from: string;
	body: string;
	decrypted?:
		| {
				subject: string;
				content: string;
		  }
		| any;
}

interface Props {
	contract: Contract;
	account: string;
	onSelect: (mail: MailItem) => void;
}
export default function MailsList(props: Props) {
	const [items, setItems] = useState<MailItem[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const step = 1000;
	const fetchMails = async () => {
		if ((props.contract, props.account)) {
			let filter = props.contract.filters.sent(null, props.account);
			const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
			let currentBlock = await provider.getBlockNumber();
			let results = await props.contract.queryFilter(filter, currentBlock - offset - step - 1, currentBlock - offset);
			//

			// let results = await provider.getLogs({
			// 	...filter,
			// 	fromBlock: currentBlock - 2000 - offset,
			// 	toBlock: currentBlock - offset,
			// });
			let fetchedItems = formatList(results).reverse();
			setItems((oldItems) => {
				if (fetchedItems.length == 0) return oldItems;
				if (oldItems.length == 0) return fetchedItems;
				if (oldItems[oldItems.length - 1].id == fetchedItems[fetchedItems.length - 1].id) return oldItems;
				return [...oldItems, ...fetchedItems];
			});
		}
	};
	const formatList = (dataList: any[]) => {
		let fetchedItems: MailItem[] = dataList
			.map((item) => {
				if (item.decode) {
					let data = item.decode(item.data, item.topics);
					return {
						id: BigNumber.from(data["_id"]).toNumber(),
						from: data["_from"] as string,
						body: data["_value"] as string,
					};
				}
				return null;
			})
			.filter((x) => x != null) as MailItem[];
		return fetchedItems;
	};

	useEffect(() => {
		console.log("i fire once");
		if (props.contract) {
			let filter = props.contract.filters.sent(null, props.account);
			props.contract.on(filter, (_from, _to, _id, _value, data) => {
				// let data = { _from, _to, _id, _value };
				console.log("new Mail");

				let newMail = formatList([data]);
				setItems((oldItems) => {
					if (newMail.length == 0) return oldItems;
					if (oldItems.length == 0) return newMail;
					if (oldItems[0].id == newMail[0].id) return oldItems;
					return [...newMail, ...oldItems];
				});
			});
		}
	}, [props.contract, props.account]);
	useEffect(() => {
		setLoading(true);
		fetchMails().then(() => {
			setLoading(false);
		});
	}, [offset]);
	return (
		<div
			style={{
				boxSizing: "border-box",
				boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
				padding: "1rem",
				borderRadius: "1rem",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div className="title">All Mails</div>
			<div
				className="node"
				style={{
					color: "gray",
					fontSize: "0.8rem",
				}}
			>
				<span>loaded till last {offset + step} blocks</span>
			</div>
			<div
				className="list"
				style={{
					// boxShadow: "rgb(68 68 68 / 75%) 0px 2px 4px 0px inset",
					boxShadow: "rgb(0 0 0 / 14%) 0px 1px 3px 0px, rgb(27 31 35 / 55%) 0px 0px 0px 1px",
					borderRadius: "0.5rem",
					flexGrow: 1,
					overflowY: "auto",
				}}
			>
				{items?.map((item) => {
					return (
						<MailListItem
							key={item.id}
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								props.onSelect(item);
							}}
						>
							{item.id} : {item.from.substring(0, 10)}...{item.from.substring(item.from.length - 10)}
						</MailListItem>
					);
				})}
			</div>
			<button
				style={{
					gap: "1rem",
					display: "flex",
					justifyContent: "center",
				}}
				onClick={() => {
					setOffset((curOffset) => curOffset + step);
				}}
				disabled={loading}
			>
				{loading ? <span className="loader"></span> : ""} Load More
			</button>
		</div>
	);
}
