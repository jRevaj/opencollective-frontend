import React from 'react';
import PropTypes from 'prop-types';
import momentTimezone from 'moment-timezone';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { getErrorFromGraphqlException } from '../lib/errors';
import { addCreateCollectiveMutation } from '../lib/graphql/mutations';

import Body from './Body';
import CollectiveNavbar from './CollectiveNavbar';
import EditEventForm from './EditEventForm';
import Footer from './Footer';
import Header from './Header';

class CreateEvent extends React.Component {
  static propTypes = {
    parentCollective: PropTypes.object,
    createCollective: PropTypes.func,
    LoggedInUser: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const timezone = momentTimezone.tz.guess();
    this.state = {
      event: {
        parentCollective: props.parentCollective,
        timezone, // "Europe/Brussels", // "America/New_York"
      },
      result: {},
    };
    this.createEvent = this.createEvent.bind(this);
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.error = this.error.bind(this);
    this.resetError = this.resetError.bind(this);
  }

  error(msg) {
    this.setState({ result: { error: msg } });
  }

  resetError() {
    this.error();
  }

  async createEvent(EventInputType) {
    const { parentCollective } = this.props;
    this.setState({ status: 'loading' });
    EventInputType.type = 'EVENT';
    EventInputType.ParentCollectiveId = parentCollective.id;
    try {
      const res = await this.props.createCollective(EventInputType);
      const event = res.data.createCollective;
      const eventUrl = `${window.location.protocol}//${window.location.host}/${parentCollective.slug}/events/${event.slug}`;
      this.setState({
        status: 'idle',
        result: { success: `Event created successfully: ${eventUrl}` },
      });
      window.location.replace(eventUrl);
    } catch (err) {
      const errorMsg = getErrorFromGraphqlException(err).message;
      this.setState({
        status: 'idle',
        result: { error: errorMsg },
      });
      throw new Error(errorMsg);
    }
  }

  async handleTemplateChange(event) {
    delete event.id;
    delete event.slug;
    this.setState({ event, tiers: event.tiers });
  }

  render() {
    const { parentCollective, LoggedInUser } = this.props;
    const canCreateEvent = LoggedInUser && LoggedInUser.canEditCollective(parentCollective);

    const collective = parentCollective || {};
    const title = `Create a New ${collective.name} Event`;

    return (
      <div className="CreateEvent">
        <style jsx>
          {`
            .result {
              text-align: center;
              margin-bottom: 5rem;
            }
            .success {
              color: green;
            }
            .error {
              color: red;
            }
            .EventTemplatePicker {
              max-width: 700px;
              margin: 0 auto;
            }
            .EventTemplatePicker .field {
              margin: 0;
            }
            .login {
              margin: 0 auto;
              text-align: center;
            }
          `}
        </style>

        <Header title={title} className={this.state.status} LoggedInUser={this.props.LoggedInUser} />

        <Body>
          <CollectiveNavbar collective={collective} isAdmin={canCreateEvent} />

          <div className="content">
            {!canCreateEvent && (
              <div className="login">
                <p>
                  <FormattedMessage
                    id="events.create.login"
                    defaultMessage="You need to be logged in as a core contributor of this collective to be able to create an event."
                  />
                </p>
                <p>
                  <Button bsStyle="primary" href={`/signin?next=/${collective.slug}/events/new`}>
                    <FormattedMessage id="signIn" defaultMessage="Sign In" />
                  </Button>
                </p>
              </div>
            )}
            {canCreateEvent && (
              <div>
                <EditEventForm
                  event={this.state.event}
                  onSubmit={this.createEvent}
                  onChange={this.resetError}
                  loading={this.state.status === 'loading'}
                />
                <div className="result">
                  <div className="success">{this.state.result.success}</div>
                  <div className="error">{this.state.result.error}</div>
                </div>
              </div>
            )}
          </div>
        </Body>

        <Footer />
      </div>
    );
  }
}

export default addCreateCollectiveMutation(CreateEvent);
