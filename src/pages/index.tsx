import Head from 'next/head'
import { GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import Header from '../components/Header';

import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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

export default function Home({ postsPagination:{results, next_page} }: HomeProps) {

  const [posts, setPosts] = useState(results)
  const [nextPage, setNextPage] = useState(next_page)

  const loadMore = async () => {
    await fetch(nextPage)
            .then(response => response.json())
            .then(response => {
              {
                const results = response.results.map(post => {
                  return {
                    uid: post.uid,      
                    first_publication_date: post.first_publication_date,
                    data: {
                      title: post.data.title,
                      subtitle: post.data.subtitle,
                      author: post.data.author
                    }
                  }
                });
                setPosts([...posts,  ...results]);
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
                <Link href={"/post/" + post.uid}> 
                  <a>{post.data.title}</a>                  
                </Link>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar/> 
                  <span>
                    {/*post.first_publication_date*/}
                    {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        { locale: ptBR }
                    )}
                  </span>
                  <FiUser/> <span>{post.data.author}</span>
                </div> 
              </div>
            ))} 

            <p onClick={ () => { loadMore() } }>
              { nextPage === null ? '' : 'Carregar mais posts'}              
            </p>         
        </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
    
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    //fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2
  });
  
  /*
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
  */
  
  const postsPagination = { results: postsResponse.results, next_page: postsResponse.next_page };

  return {
    props: {postsPagination},
    revalidate: 60 * 60 
  }
};