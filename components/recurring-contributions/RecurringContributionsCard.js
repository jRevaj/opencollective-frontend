import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { withRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';

import Avatar from '../Avatar';
import Container from '../Container';
import FormattedMoneyAmount from '../FormattedMoneyAmount';
import { Flex } from '../Grid';
import I18nCollectiveTags from '../I18nCollectiveTags';
import LinkCollective from '../LinkCollective';
import StyledButton from '../StyledButton';
import StyledCard from '../StyledCard';
import StyledTag from '../StyledTag';
import { P } from '../Text';
import { withUser } from '../UserProvider';

import RecurringContributionsPopUp from './RecurringContributionsPopUp';

const getBackground = collective => {
  const backgroundImage = collective.backgroundImageUrl || get(collective, 'parentCollective.backgroundImageUrl');
  const primaryColor = get(collective.settings, 'collectivePage.primaryColor', '#1776E1');
  return backgroundImage
    ? `url(/static/images/collective-card-mask.svg) 0 0 / cover no-repeat, url(${backgroundImage}) 0 0 / cover no-repeat, ${primaryColor}`
    : `url(/static/images/collective-card-mask.svg) 0 0 / cover no-repeat, ${primaryColor}`;
};

const messages = defineMessages({
  amountContributed: {
    id: 'Subscriptions.AmountContributed',
    defaultMessage: 'Amount contributed',
  },
  contributedToDate: {
    id: 'Subscriptions.ContributedToDate',
    defaultMessage: 'Contributed to date',
  },
  manage: {
    id: 'Subscriptions.Edit',
    defaultMessage: 'Edit',
  },
  activate: {
    id: 'Subscriptions.Activate',
    defaultMessage: 'Activate',
  },
  ourPurpose: {
    id: 'SubscriptionsCard.ourPurpose',
    defaultMessage: 'Our purpose',
  },
});

const RecurringContributionsCard = ({ collective, status, contribution, createNotification, account, ...props }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isHovering, setHovering] = useState(false);

  const { formatMessage } = useIntl();
  const statusTag = `${status} contribution`;
  const buttonText = status === 'ACTIVE' ? formatMessage(messages.manage) : formatMessage(messages.activate);
  const userIsLoggedInUser = props.LoggedInUser.collective.slug === props.router.query.collectiveSlug;
  // const userIsAdminOfCollectiveOrOrg
  const userIsAdmin = userIsLoggedInUser; // || userIsAdminOfCollectiveOrOrg

  return (
    <StyledCard onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} {...props}>
      <Container style={{ background: getBackground(collective) }} backgroundSize="cover" height={100} px={3} pt={26}>
        <Container border="2px solid white" borderRadius="25%" backgroundColor="white.full" width={68}>
          <LinkCollective collective={collective}>
            <Avatar collective={collective} radius={64} />
          </LinkCollective>
        </Container>
      </Container>
      <Flex flexDirection="column" justifyContent="space-around" height={260}>
        <Container p={2}>
          {isHovering && !showPopup ? (
            <Fragment>
              <P fontSize="Caption" fontWeight="bold">
                {formatMessage(messages.ourPurpose)}
              </P>
              <P fontSize="Caption" color="black.800">
                {collective.description}
              </P>
            </Fragment>
          ) : (
            <P fontSize="LeadParagraph" fontWeight="bold" color="black.800">
              {collective.name}
            </P>
          )}
          <StyledTag display="inline-block" textTransform="uppercase" my={2}>
            <I18nCollectiveTags tags={statusTag} />
          </StyledTag>
        </Container>
        <Container p={2} flexGrow={1} display="flex" flexDirection="column" justifyContent="space-around">
          <Flex flexDirection="column">
            <P fontSize="Paragraph" fontWeight="400">
              {formatMessage(messages.amountContributed)}
            </P>
            <P fontSize="Paragraph" fontWeight="bold">
              <FormattedMoneyAmount
                amount={contribution.amount.value * 100}
                interval={contribution.frequency.toLowerCase().slice(0, -2)}
                currency={contribution.amount.currency}
              />
            </P>
          </Flex>
          <Flex flexDirection="column" mb={2}>
            <P fontSize="Paragraph" fontWeight="400">
              {formatMessage(messages.contributedToDate)}
            </P>
            <P fontSize="Paragraph">
              <FormattedMoneyAmount
                amount={contribution.totalDonations.value * 100}
                currency={contribution.totalDonations.currency}
              />
            </P>
          </Flex>
          {userIsAdmin && (
            <StyledButton buttonSize="tiny" onClick={() => setShowPopup(true)}>
              {buttonText}
            </StyledButton>
          )}
        </Container>
      </Flex>
      {showPopup && (
        <RecurringContributionsPopUp
          contribution={contribution}
          status={status}
          setShowPopup={setShowPopup}
          createNotification={createNotification}
          account={account}
        />
      )}
    </StyledCard>
  );
};

RecurringContributionsCard.propTypes = {
  collective: PropTypes.object.isRequired,
  contribution: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
  LoggedInUser: PropTypes.object.isRequired,
  hover: PropTypes.bool,
  createNotification: PropTypes.func,
  account: PropTypes.object.isRequired,
};

export default withUser(withRouter(RecurringContributionsCard));
