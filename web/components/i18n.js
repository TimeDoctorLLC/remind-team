import React from 'react'
import i18next from 'i18next';
import { Component, PropTypes, Children } from 'react';
import resources from '../locales';

class I18nextProvider extends Component {
  constructor(props, context) {
    super(props, context);
    this.i18n = i18next;
  }

  getChildContext() {
    return { i18n: this.i18n, t: ((key, opts) => {
      const translation = this.i18n.t(key, opts);
      if(translation.indexOf('<strong>') >= 0 || translation.indexOf('<br />') >= 0) {
        return (<span dangerouslySetInnerHTML={{__html: translation}}></span>);
      }
      return translation;
    }) };
  }

  componentWillMount() {
    i18next.init({
        interpolation: {
          escapeValue: false
        },
        lng: 'en',
        resources: resources
    }, (err, t) => {
        if(err) {
            console.error('Unable to initialize i18n!', err);
            return;
        }
        this.setState({ ready: true });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.i18n !== nextProps.i18n) {
      throw new Error('[I18nextProvider] does not support changing the i18n object.');
    }
  }

  render() {
    if(!this.state.ready) {
        return null;
    }

    const { children } = this.props;
    return Children.only(children);
  }
}

I18nextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

I18nextProvider.childContextTypes = {
  i18n: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
};

export default I18nextProvider;