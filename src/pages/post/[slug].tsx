  
import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import Header from '../../components/Header';
import UtterancesComments from '../../components/UtterancesComments';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  preview: boolean;
  post: Post;
  nextPost: Post | null;
  prevPost: Post | null;
}

export default function Post({
  preview,
  post,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  const readTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    let fullText = '';
    const readWordsPerMinute = 200;

    post.data.content.forEach(postContent => {
      fullText += postContent.heading;
      fullText += RichText.asText(postContent.body);
    });

    const time = Math.ceil(fullText.split(/\s/g).length / readWordsPerMinute);

    return time;
  }, [post, router.isFallback]);

  const isEditedPost = useMemo(() => {
    if (router.isFallback) {
      return false;
    }

    return post.last_publication_date !== post.first_publication_date;
  }, [post, router.isFallback]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>
      <Header />

      <main className={styles.container}>
        <header>
          <img src={post.data.banner.url} alt={post.data.title} />
        </header>
        <section>
          <article className={styles.postContent}>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfos}>              
              <FiCalendar />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
              <FiUser />
              <span>
                {post.data.author}
              </span>
              <FiClock />
              <span>                
                {readTime} min
              </span>
            </div>
            {isEditedPost && (
              <div className={styles.postEdited}>
                <span>
                  * editado em{' '}
                  <time>
                    {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        { locale: ptBR }
                    )}
                  </time>                  
                </span>
              </div>
            )}
            <div className={styles.postBody}>
              {post.data.content.map(postContent => {
                return (
                  <div key={postContent.heading}>
                    <h1>{postContent.heading}</h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(postContent.body),
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <footer>
              <div>
                {prevPost && (
                  <Link href={`/post/${prevPost.uid}`}>
                    <a>
                      <span>Post anterior</span>
                      <h4>{prevPost.data.title}</h4>                      
                    </a>
                  </Link>
                )}
              </div>
              <div>
                {nextPost && (
                  <Link href={`/post/${nextPost.uid}`}>
                    <a>
                      <span>Próximo post</span>
                      <h4>{nextPost.data.title}</h4>                      
                    </a>
                  </Link>
                )}
              </div>
            </footer>
          </article>          
          <UtterancesComments />
          {preview && (
            <aside className={commonStyles.exitPreviewButton}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2, // posts per page
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  return {
    props: {
      preview,
      nextPost: nextPost.results[0] ?? null,
      prevPost: prevPost.results[0] ?? null,
      post: response,
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
};