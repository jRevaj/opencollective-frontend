import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import { generateNotFoundError } from '../lib/errors';
import { API_V2_CONTEXT, gqlV2 } from '../lib/graphql/helpers';

import CreateFund from '../components/create-fund';
import ErrorPage from '../components/ErrorPage';
import Page from '../components/Page';
import { withUser } from '../components/UserProvider';

const GET_HOST = gqlV2`
  query host($slug: String!) {
    host(slug: $slug) {
      id
      type
      slug
      name
      currency
      isOpenToApplications
      termsUrl
    }
  }
`;

const CreateFundPage = ({ loadingLoggedInUser, LoggedInUser }) => {
  const router = useRouter();
  const slug = router.query.hostCollectiveSlug;
  const skipQuery = !LoggedInUser || !slug;
  const { loading, error, data } = useQuery(GET_HOST, {
    context: API_V2_CONTEXT,
    skip: skipQuery,
    variables: { slug },
  });

  if (loading || loadingLoggedInUser) {
    return <ErrorPage loading={true} />;
  }

  if (!skipQuery && (!data || !data.host)) {
    return <ErrorPage error={generateNotFoundError(slug, true)} data={{ error }} log={false} />;
  }

  console.log('CreateFundPage');

  return (
    <Page>
      <CreateFund host={data && data.host} />
    </Page>
  );
};

CreateFundPage.propTypes = {
  loadingLoggedInUser: PropTypes.bool.isRequired,
  LoggedInUser: PropTypes.object,
};

export default withUser(CreateFundPage);
