import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import registerServiceWorker from "./registerServiceWorker";
import "semantic-ui-css/semantic.min.css";
import firebase from "./firebase";
import Spinner from "./Spinner";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

import rootReducers from "./reducers";
import { setUser, clearUser } from "./actions";

const middleware = [thunk];

const store = createStore(
  rootReducers,
  composeWithDevTools(applyMiddleware(...middleware))
);

class Root extends React.Component {
  componentDidMount() {
    const { history, onSetUser, onClearUser } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        onSetUser(user);
        history.push("/");
      } else {
        history.push("/login");
        onClearUser();
      }
    });
  }
  render() {
    const { isLoading } = this.props;
    return isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  onSetUser: (user) => dispatch(setUser(user)),
  onClearUser: () => dispatch(clearUser()),
});

const mapStateToProps = (state) => ({
  dataUser: state.user.currentUser,
  isLoading: state.user.isLoading,
});

const MainRoot = withRouter(connect(mapStateToProps, mapDispatchToProps)(Root));

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <MainRoot />
    </Router>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
