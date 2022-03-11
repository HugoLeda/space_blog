import Head from 'next/head'

import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <Header/>
        <main className={styles.listPosts}>
          <div className={styles.post}>
            <h1>
              Como utilizar hooks
            </h1>
            <p>
              Pensando em sincronização em vez de ciclos de vida
            </p>
            <div>
              <FiCalendar/> <span>15 mar 2022</span>
              <FiUser/> <span>Rafaela Rosolem </span>
            </div>          
          </div>
          <div className={styles.post}>
            <h1>
              Como utilizar hooks
            </h1>
            <p>
              Pensando em sincronização em vez de ciclos de vida
            </p>
            <div>
              <FiCalendar/> <span>15 mar 2022</span>
              <FiUser/> <span>Rafaela Rosolem </span>
            </div>          
          </div>
        </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.tile', 'posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'],
    pageSize: 100,
  });

  console.log(postsResponse)


};