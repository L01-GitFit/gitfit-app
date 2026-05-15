import React from 'react';

jest.mock('expo-router/html', () => ({
  ScrollViewStyleReset: () => 'SCROLL_VIEW_STYLE_RESET',
}));

import Root from '@/app/+html';

describe('Web Root HTML (+html)', () => {
  it('returns html shell with expected head and body elements', () => {
    const child = React.createElement('span', null, 'content');
    const element = Root({ children: child });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('en');

    const [head, body] = React.Children.toArray(element.props.children) as React.ReactElement[];

    expect(head.type).toBe('head');
    expect(body.type).toBe('body');

    const bodyChildren = React.Children.toArray(body.props.children) as React.ReactElement[];
    expect(bodyChildren[0].type).toBe('span');
    expect(bodyChildren[0].props.children).toBe('content');
  });

  it('contains viewport meta and responsive background css', () => {
    const element = Root({ children: 'child' });
    const [head] = React.Children.toArray(element.props.children) as React.ReactElement[];
    const headChildren = React.Children.toArray(head.props.children) as React.ReactElement[];

    const viewportMeta = headChildren.find(
      (node) => React.isValidElement(node) && node.type === 'meta' && node.props.name === 'viewport',
    ) as React.ReactElement | undefined;

    const styleNode = headChildren.find(
      (node) => React.isValidElement(node) && node.type === 'style',
    ) as React.ReactElement | undefined;

    expect(viewportMeta?.props.content).toBe(
      'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover',
    );

    const css = styleNode?.props.dangerouslySetInnerHTML?.__html as string;
    expect(css).toContain('background-color: #fff');
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain('background-color: #000');
  });
});
