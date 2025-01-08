import { useState } from 'react';
import Menu from './Menu';
import Footer from './Footer';

export default function Capsule() {
    const [selected, setSelected] = useState<string | null>('/music');

    return (
        <>
            <Menu setSelected={setSelected} selected={selected} />
            <Footer setSelected={setSelected} />
        </>
    );
}
