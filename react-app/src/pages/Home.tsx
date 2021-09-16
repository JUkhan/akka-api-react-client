
import React from 'react';
import MessageTable from '../componentts/MessageTable';
import SearchForm from '../componentts/SearchForm';
const Home = () => {
    return (<div style={{ marginTop: 20 }}>
        <SearchForm />
        <MessageTable />
    </div>);
}
export default Home;
