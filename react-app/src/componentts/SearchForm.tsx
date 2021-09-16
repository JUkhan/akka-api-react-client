import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import { useForm } from '@jukhan/react-form';
import { Get } from 'ajwahjs'
import { AnalyserState } from '../state/AnalyserState'
import { idText } from 'typescript';
const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 250,
    },
}));
//defaultValue="2017-05-24T10:30"
function SearchForm() {
    const ctrl = Get(AnalyserState)
    const classes = useStyles();
    const { setValue, getValue, formData, setFormData } = useForm();
    function submit() {
        const data = formData();
        if (!data.dateTimeFrom) data.dateTimeFrom = '2021-01-01T01:01';
        if (!data.dateTimeUntil) data.dateTimeUntil = '2021-12-30T23:58';
        if (!data.phrase) data.phrase = '';

        ctrl.search({ ...data });
    }
    return (
        <form className={classes.container} noValidate>
            <TextField
                label="From"
                type="datetime-local"
                value={getValue("dateTimeFrom")}
                onChange={(e) => setValue("dateTimeFrom", e.target.value)}
                className={classes.textField}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                id="datetimeUntil"
                label="To"
                type="datetime-local"
                value={getValue("dateTimeUntil")}
                onChange={(e) => setValue("dateTimeUntil", e.target.value)}
                className={classes.textField}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                id="phrase"
                label="Phrase"
                type="text"
                value={getValue("phrase")}
                onChange={(e) => setValue("phrase", e.target.value)}
                className={classes.textField}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <Button color="primary" size="small"
                onClick={() => submit()}
                startIcon={<SearchIcon />}>
                Search
            </Button>
        </form>
    );
}
export default SearchForm;