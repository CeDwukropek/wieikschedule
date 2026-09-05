// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// CRA's SVG test transformer emits the pre-React 19 element symbol.
jest.mock('./Menu/Subtract.svg', () => ({
  ReactComponent: (props) => require('react').createElement('svg', props),
}));
