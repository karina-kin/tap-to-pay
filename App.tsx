import React from 'react'
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native'
import TapToPay from './src/TapToPay'
import DiscoverScreen from './src/DiscoverScreen'

const App = (): React.JSX.Element => {

	const fetchTokenProvider = async () => {
		const response = await fetch(`https://api.stripe.com/v1/terminal/connection_tokens`, {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer sk_test_51K1fJzIJL1IwHhY9SLLTAZSmY8LWWeOLRMZulURGK34P61MHbj03DD4Jod3YIYYmWnotccpRb013stVqzNTLSw5B00qvkIOHeJ',
				'Content-Type': 'application/json',
			},
		});
		const { secret } = await response.json();
		console.log('secret', secret)
		return secret;
		// const response = await fetch(`https://dev.internal.api.liefersoft.de/payment/terminals/term-123/paymentSessions`, {
		//     method: 'POST',
		//     headers: {
		//         'Content-Type': 'application/json',
		//     },
		// });
		// const {secret} = await response.json();

		//return 'pst_test_YWNjdF8xSzFmSnpJSkwxSXdIaFk5LHNaQ1NGSGpVY3RhQ2R5OGhpUkdTc1N0Qzg4VGE1d0E_00fKrtI7vJ'
	}
//console.log('fetchTokenProvider1',fetchTokenProvider())
	return (
		<StripeTerminalProvider logLevel="verbose" tokenProvider={fetchTokenProvider}>
			<TapToPay />
		</StripeTerminalProvider>
	)
}
export default App
