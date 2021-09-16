import React from 'react';
import Container from '@material-ui/core/Container';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Histogram from './pages/Histogram';
import Home from './pages/Home';
import ButtonAppBar from './componentts/Nav';

function App() {
  return (
    <Router>

      <ButtonAppBar />
      <Container maxWidth="md">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/histogram" component={Histogram} />
        </Switch>
      </Container>
    </Router>

  );
}

export default App;
