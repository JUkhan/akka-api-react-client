import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { Get } from 'ajwahjs'
import { AnalyserState, MessageData, Position } from '../state/AnalyserState';
import { useStream } from '../hooks';
import { map } from 'rxjs/operators';

function splitText(arr: Position[], str: string): Array<{ text: string, isHighlight: boolean }> {

    if (arr.length === 0) return [{ text: str, isHighlight: false }];
    const res = [];
    if (arr[0].fromPosition > 0) {
        res.push({
            text: str.substring(0, arr[0].fromPosition),
            isHighlight: false,
        });
    }

    arr.reduce((acc, item, index) => {
        if (index > 0 && item.toPosition - arr[index - 1].fromPosition > 1) {
            res.push({
                text: str.substring(arr[index - 1].toPosition + 1, item.fromPosition),
                isHighlight: false,
            });
        }
        acc.push({
            text: str.substring(item.fromPosition, item.toPosition + 1),
            isHighlight: true,
        });
        return acc;
    }, res);
    const pos = arr[arr.length - 1];
    if (pos.toPosition + 1 < str.length) {
        res.push({
            text: str.substring(pos.toPosition + 1),
            isHighlight: false,
        });
    }
    return res;
}
const MessageTable = () => {
    const ctrl = Get(AnalyserState)
    const rows = useStream<MessageData[]>(ctrl.stream$.pipe(map(s => s.data)), ctrl.state.data);

    return <TableContainer style={{ marginTop: 20 }} component={Paper}>
        <Table aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell>Date Time</TableCell>
                    <TableCell>Message</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow
                        key={index}
                    >

                        <TableCell align="left">{row.datetime}</TableCell>
                        <TableCell align="left">{splitText(row.highlightText, row.message).map((it, ind) => <span key={ind} className={it.isHighlight ? 'highlighted' : ''}>{it.text}</span>)}</TableCell>

                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}
export default MessageTable;