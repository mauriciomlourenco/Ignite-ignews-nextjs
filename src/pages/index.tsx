import { GetStaticProps } from 'next';
//import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { homedir } from 'os';

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

// Client-side
//Server-side
//Static side Generation

interface HomeProps {
  product: {
    priceId: string,
    amount: number;
  }
}

export default function Home({ product } : HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>Get access to all the publications <br />
          <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />

        </section>

        <img src="/images/avatar.svg" alt="Girl codding" />
      </main>
    </>
  )
}

/*export const getServerSideProps: GetServerSideProps = async () => {*/
export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1L2gN0Ez4b3ouJZJRW8cfW4W'/*, {
    expand: ['product']
  }*/);

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US',{
      style: 'currency',
      currency: 'USD',
      }).format(price.unit_amount / 100),
   };
  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}
