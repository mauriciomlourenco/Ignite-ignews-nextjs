import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton( { priceId }: SubscribeButtonProps) {
    const {data: session} = useSession();
    const router = useRouter();

    async function handleSubscribe() {
        if(!session){
            signIn('github');
            return;
        }

        if(session?.activeSubscription){
            router.push('/posts');
            return;
        }

        // Criação da checkout session

        // getServerSideProps (SSR) => utilizada na renderização da página
        // getStaticProps(SSG) => utilizada na renderização da página
        // => API routes => Utilizada a partir do click do usuário, depois da página renderizada
        
        try {
            const response = await api.post('/subscribe');

            const { sessionId } = response.data;

            const stripe = await getStripeJs();

            await stripe.redirectToCheckout({ sessionId });
        } catch (err) {
            alert(err.message);
        }

    }
    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    );
}