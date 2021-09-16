import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { useHistory } from 'react-router-dom';
import { Get } from 'ajwahjs'
import { AnalyserState } from '../state/AnalyserState';
import { useStream } from '../hooks';
import { map } from 'rxjs/operators';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

function ButtonAppBar() {
    const ctrl = Get(AnalyserState)
    const data = useStream(ctrl.stream$.pipe(map(s => s.histogram)), {});
    const classes = useStyles();
    let history = useHistory();
    function homeClick() {
        history.push("/");
    }
    function histogramClick() {
        history.push("/histogram");
    }
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton onClick={homeClick} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    {data.labels && <Typography variant="h6" className={classes.title}>
                        <Button color="inherit" onClick={histogramClick}>
                            Histogram
                        </Button>
                    </Typography>}

                </Toolbar>
            </AppBar>
        </div>
    );
}
export default ButtonAppBar;