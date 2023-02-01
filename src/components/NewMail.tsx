import { encryptSafely } from "@metamask/eth-sig-util";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
interface Props {
	to: string | null;
	OnSend: (data: string, toAddress: string) => Promise<void>;
	pubKey: string;
}

export default function NewMail(props: Props) {
	const contentRef = useRef<any>();
	const destAddress = useRef<any>();
	const subject = useRef<any>();
	const [loading, setLoading] = useState<boolean>(false);

	const encrypt = (data: any) => {
		let enc = encryptSafely({
			publicKey: props.pubKey,
			version: "x25519-xsalsa20-poly1305",
			data: JSON.stringify(data),
		});
		return JSON.stringify(enc);
	};
	const clearAll = () => {
		contentRef.current.value = "";
		destAddress.current.value = "";
	};
	useEffect(() => {
		contentRef.current.value = "";
		destAddress.current.value = props.to || "";
	}, [props.to]);
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
			<div className="toolber">
				<button
					style={{
						gap: "1rem",
						display: "flex",
						justifyContent: "center",
					}}
					onClick={() => {
						setLoading(true);
						props
							.OnSend(
								encrypt({
									content: contentRef.current.value as string,
									subject: subject.current.value as string,
								}),
								destAddress.current.value
							)
							.then(() => {
								clearAll();
							})
							.catch(() => {})
							.finally(() => {
								setLoading(false);
							});
					}}
					disabled={loading}
				>
					{loading ? <span className="loader"></span> : ""} Send
				</button>
			</div>
			<label>To Address</label>
			<input
				type="text"
				ref={destAddress}
				// onInput={(data: ChangeEvent<HTMLInputElement>) => {
				// 	let text = data.target.value;
				// 	console.log(data);
				// 	setDestAddress(text);
				// }}
				style={{
					width: "-webkit-fill-available",
					border: "none",
					borderRadius: "5px",
					padding: "5px",
					margin: "1rem 0rem",
				}}
			/>
			<label>Subject</label>
			<input
				type="text"
				ref={subject}
				// onInput={(data: ChangeEvent<HTMLInputElement>) => {
				// 	let text = data.target.value;
				// 	console.log(data);
				// 	setDestAddress(text);
				// }}
				style={{
					width: "-webkit-fill-available",
					border: "none",
					borderRadius: "5px",
					padding: "5px",
					margin: "1rem 0rem",
				}}
			/>
			<div
				className="textbox"
				style={{
					margin: "1rem 0rem",
					flexGrow: 1,
				}}
			>
				<label>Content</label>
				<textarea
					ref={contentRef}
					// onChange={(data: ChangeEvent<HTMLTextAreaElement>) => {
					// 	let text = data.target.value;
					// 	console.log(text);
					// 	setContent(text);
					// }}
					style={{
						width: "-webkit-fill-available",
						border: "none",
						borderRadius: "5px",
						padding: "5px",
						boxSizing: "border-box",
						height: "100%",
					}}
				></textarea>
			</div>
		</div>
	);
}
