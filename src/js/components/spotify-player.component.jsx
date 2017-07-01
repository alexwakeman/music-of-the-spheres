import * as React from 'react';
import PropTypes from 'prop-types';

export function SpotifyPlayerComponent({embedUrl}) {
    return (
        <iframe src={embedUrl} width="300" height="80" />
    )
}

SpotifyPlayerComponent.propTypes = {
	embedUrl: PropTypes.string
};