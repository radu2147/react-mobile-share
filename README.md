## react-mobile-share ![Checks](https://github.com/radu2147/react-mobile-share/actions/workflows/checks.yml/badge.svg)

A small package developed on top of mobile's built-in share api (See [Web share api](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)).
### Features

- Lightweight
- Support for shortlink generation

### Install

```
npm i -D react-mweb-share
yarn add -D react-mweb-share
```

### Examples

```
import { useMobileShare } from 'react-mweb-share';

const Button = ({url}: Props) -> {
    const { share } = useMobileShare({url, title: "Howdy});
    return (
        <button onClick={share}>
            Share!
        </button>
    );
}
```

### License
[MIT](LICENSE)
