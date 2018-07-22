import {connect} from 'react-redux';
import {SceneComponent} from '../components/scene.component';

const mapStateToProps = (state) => {
    return {
        artist: state.artist
    }
};

const SceneContainer = connect(mapStateToProps)(SceneComponent);

export default SceneContainer;
