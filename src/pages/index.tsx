import Head from 'next/head'
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useState } from 'react';

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

export default function Home({ next_page, results }) {

  const [posts, setPosts] = useState(results)
  const [nextPage, setNextPage] = useState(next_page)

  const loadMore = async () => {
    await fetch(next_page)
            .then(response => response.json())
            .then(response => {
              {
                setPosts([...posts,  ...response.results]);
                setNextPage(response.next_page)                
              }
            })
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <Header/>
        <main className={styles.listPosts}>
          
            {posts.map(post => (
              <div className={styles.post} key={post.uid}>
                <h1>{post.title}</h1>
                <p>{post.subtitle}</p>
                <div>
                  <FiCalendar/> <span>{posts.first_publication_date}</span>
                  <FiUser/> <span>{posts.author}</span>
                </div> 
              </div>
            ))}          
        </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
    
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2
  });
  
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,      
      first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-br', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });
  
  const postsPagination = { results, next_page: postsResponse.next_page };

  return {
    props: postsPagination
  }
};