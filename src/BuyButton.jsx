import { Button } from 'reactstrap'
import {loadStripe} from '@stripe/stripe-js';
import { API } from 'aws-amplify';

export function BuyButton({price}) {
    const handleClick = async () => {
      const checkoutSession = await API.post('stripeapi', `/shop/products/${price.id}/checkout`)

        const stripe = await loadStripe(process.env.REACT_APP_API_STRIPE_PUBLISHABLE_API_KEY)
        stripe.redirectToCheckout({
        sessionId: checkoutSession.id
        })
    }
    return (
        <Button block onClick={handleClick}>
            {`${price.unit_amount.toLocaleString()} ${price.currency.toLocaleUpperCase()}`}
            {price.recurring ? (
            <>
                {` / per ${price.recurring.interval_count} ${price.recurring.interval}`}
                </>
            ): null}
      </Button>
    )
}
