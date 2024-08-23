import React, { useEffect, useState } from 'react';
import { requestNeededAndroidPermissions, useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { FlatList, Text, View } from 'react-native';
import DiscoverReadersScreen from './DiscoverReadersScreen';
import CollectCardPaymentScreen from './CollectCardPayment';

const TapToPay = () => {
	const { initialize: initStripe } = useStripeTerminal({
		//onUpdateDiscoveredReaders: (readers) => {
			// 			// The `readers` variable will contain an array of all the discovered readers.
					//	console.log('readers', readers)
						//setReader2(readers);
		//			},
	});
	const [initialized, setInitialized] = useState(false);
	const [errorReader, setErrorReader] = useState('NO error');
	const [granted2, setGranted2] = useState('granted Default');
	const [hasPerms, setHasPerms] = useState(false);

	const [] = useState('');
	console.log('initialized', initialized);


	useEffect(() => {
		const initAndClear = async () => {
			const { error, reader } = await initStripe();

			if (error) {
				console.log(error.message);
				return;
			}
			console.log('reader', reader)
			if (reader) {
				console.log(
					'StripeTerminal has been initialized properly and connected to the reader',
					reader
				);
				return;
			}

			console.log('StripeTerminal has been initialized properly');
			setInitialized(true)
		};
		if (hasPerms) {
			console.log('22222')
			initAndClear();
		}
	}, [initStripe, hasPerms]);

	const handlePermissionsSuccess = async () => {
		setHasPerms(true);
	};

	useEffect(() => {
		async function handlePermissions() {
			try {
				const { error } = await requestNeededAndroidPermissions({
					accessFineLocation: {
						title: 'Location Permission',
						message: 'Stripe Terminal needs access to your location',
						buttonPositive: 'Accept',
					},
				});
				if (!error) {
					handlePermissionsSuccess();
				} else {
					console.error(
						'Location and BT services are required in order to connect to a reader.'
					);
				}
			} catch (e) {
				console.error(e);
			}
		}
		handlePermissions();

	}, []);

	return (
		// <WebView source={{ uri: 'https://dev.app.liefersoft.de' }} style={{ marginTop: 40 }} />
		<View>
			<Text>Tap-to-Pay</Text>
			{initialized && <DiscoverReadersScreen />}
			{initialized &&  <CollectCardPaymentScreen />}
		</View>
	);
};

export default TapToPay;
