import React, { useState, useContext } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput } from 'react-native';
import {
	useStripeTerminal,
	PaymentIntent,
	StripeError,
	CommonError,
} from '@stripe/stripe-terminal-react-native';
import { colors } from '../colors';
import List from './List';
import ListItem from './ListItem';

export default function CollectCardPaymentScreen() {
	const [inputValues, setInputValues] = useState({
		amount: '20000',
		currency: 'eur',
	});
	const [testCardNumber, setTestCardNumber] = useState('4242424242424242');
	const simulated = true
	const discoveryMethod = 'localMobile'

	const {
		createPaymentIntent,
		collectPaymentMethod,
		confirmPaymentIntent,
		retrievePaymentIntent,
		cancelCollectPaymentMethod,
		setSimulatedCard,
	} = useStripeTerminal({
		onDidRequestReaderInput: (input) => {
		},
		onDidRequestReaderDisplayMessage: (message) => {
			console.log('message', message);
		},
	});

	const _createPaymentIntent = async () => {
		if (simulated) {
			await setSimulatedCard(testCardNumber);
		}

		let paymentIntent;
		let paymentIntentError;
		const response = await createPaymentIntent({
			amount: Number(inputValues.amount),
			currency: inputValues.currency,
			captureMethod: 'automatic'
		});
		paymentIntent = response.paymentIntent;
		paymentIntentError = response.error;
		console.log('paymentIntent', paymentIntent)
		if (paymentIntentError) {
			console.log('failed', paymentIntentError?.code,paymentIntentError?.message);
			return;
		}

		console.log('Create Payment Intent');

		return await _collectPaymentMethod(paymentIntent);
	};

	const _collectPaymentMethod = async (createdPaymentIntent) => {
		const { paymentIntent, error } = await collectPaymentMethod({
			paymentIntent: createdPaymentIntent,
			updatePaymentIntent: true
		});

		if (error) {
			console.log('failed collect', error.code, error.message);
		} else if (paymentIntent) {
			console.log('Collect Payment Method');
			//await _confirmPayment(createdPaymentIntent);
		}
	};

	/*const _confirmPayment = async (createdPaymentIntent) => {
		console.log('paymentIntentId', createdPaymentIntent)
		const { paymentIntent, error } = await confirmPaymentIntent(createdPaymentIntent);

		if (error) {
			console.log('Process Payment Filed', error.code, error.message);
			return;
		}

		console.log('Process Payment');
	};

	const _capturePayment = async (createdPaymentIntent) => {
		const resp = null//await api.capturePaymentIntent(paymentIntentId);

		if ('error' in resp) {
			console.log('Capture Payment Filed', resp.error.code, resp.error.message);
			return;
		}

		console.log('Capture Payment');
	};*/

	return (
		<ScrollView
			testID="collect-scroll-view"
			contentContainerStyle={styles.container}
		>
			{simulated && (
				<List bolded={false} topSpacing={false} title="CARD NUMBER">
					<TextInput
						testID="card-number-text-field"
						keyboardType="numeric"
						style={styles.input}
						value={testCardNumber}
						onChangeText={(value) => setTestCardNumber(value)}
						placeholder="card number"
					/>
				</List>
			)}
			<List bolded={false} topSpacing={false} title="AMOUNT">
				<TextInput
					testID="amount-text-field"
					keyboardType="numeric"
					style={styles.input}
					value={inputValues.amount}
					onChangeText={(value) =>
						setInputValues((state) => ({ ...state, amount: value }))
					}
					placeholder="amount"
				/>
			</List>

			<List
				bolded={false}
				topSpacing={false}
				title={`${(Number(inputValues.amount) / 100).toFixed(2)} ${
					inputValues.currency
				}`}
			>
				<ListItem
					color={colors.blue}
					title="Collect payment"
					onPress={_createPaymentIntent}
				/>
				{simulated ? (
					<Text style={styles.info}>
						Collect a card payment using a simulated reader
					</Text>
				) : (
					<Text style={styles.info}>
						Collect a card payment using a physical Stripe test card and reader
					</Text>
				)}
			</List>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.light_gray,
		paddingVertical: 22,
		flexGrow: 1,
	},
	json: {
		paddingHorizontal: 16,
	},
	input: {
		height: 44,
		backgroundColor: colors.white,
		color: colors.dark_gray,
		paddingLeft: 16,
		marginBottom: 12,
		borderBottomColor: colors.gray,
		...Platform.select({
			ios: {
				borderBottomWidth: StyleSheet.hairlineWidth,
			},
			android: {
				borderBottomWidth: 1,
				borderBottomColor: `${colors.gray}66`,
				color: colors.dark_gray,
			},
		}),
	},
	enableInteracContainer: {
		flexDirection: 'row',
		marginVertical: 16,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	info: {
		color: colors.dark_gray,
		paddingHorizontal: 16,
		marginVertical: 16,
	},
	picker: {
		width: '100%',
		...Platform.select({
			android: {
				color: colors.slate,
				fontSize: 13,
				paddingHorizontal: 16,
				paddingVertical: 12,
				backgroundColor: colors.white,
			},
		}),
	},
	pickerItem: {
		fontSize: 16,
	},
});
