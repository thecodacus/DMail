import React, { useEffect, useState } from "react";
import { MailItem } from "./MailsList";
// import { Buffer } from "buffer";

interface Props {
	item: MailItem | undefined;
	account: string | undefined;
}
export default function MailsView(props: Props) {
	const [mail, setMail] = useState<MailItem>();
	const [decrypted, setDecrypted] = useState<boolean>(false);
	const descypt = async () => {
		if (window.ethereum.request && props.account) {
			let content = `0x${(window as any).Buffer.from(JSON.stringify(JSON.parse(mail?.body || "{}")), "utf8").toString("hex")}`;
			const decrypted = await window.ethereum.request({
				method: "eth_decrypt",
				params: [content, props.account],
			});

			setMail((m) => {
				if (m) {
					m.decrypted = JSON.parse(JSON.parse(decrypted).data);
					console.log(m);
				}
				return m;
			});
			setDecrypted(true);
		}
	};

	useEffect(() => {
		setMail(props.item);
		if (!props.item?.decrypted) setDecrypted(false);
		else setDecrypted(true);
	}, [props.item]);
	return (
		<div
			key={props.item?.id}
			style={{
				boxSizing: "border-box",
				boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
				padding: "1rem",
				borderRadius: "1rem",
				textAlign: "left",
			}}
		>
			<div className="header" style={{ textAlign: "center", fontWeight: "bold", fontSize: "1rem" }}>
				Preview Pane
			</div>
			{props.item ? (
				<div
					className="preview"
					style={{
						height: "100%",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div>
						<strong>From:</strong> {props.item?.from}
					</div>
					{props.item?.decrypted ? (
						<div className="body" style={{ marginTop: "1rem" }}>
							<div className="label">
								<strong>Subject</strong>
							</div>
							<div className="value">{props.item?.decrypted.subject}</div>
							<div className="label">
								<strong>Message</strong>
							</div>
							<div className="value">{props.item?.decrypted.content}</div>
						</div>
					) : (
						<div style={{ display: "flex", flex: 1 }}>
							<div className="info">The message is encrypted. Please decrypt the message first to view the message</div>
							<button
								style={{ margin: "auto" }}
								onClick={() => {
									descypt();
								}}
								className="dcrypt"
							>
								Decrypt Message
							</button>
						</div>
					)}
				</div>
			) : (
				<></>
			)}
		</div>
	);
}
