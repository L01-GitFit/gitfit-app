import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Modal } from 'react-native';

import ApiErrorDialog from '@/components/ApiErrorDialog';

describe('ApiErrorDialog', () => {
  it('renders default title and message when visible', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ApiErrorDialog visible message="Network timeout" onClose={onClose} />,
    );

    expect(getByText('Request failed')).toBeTruthy();
    expect(getByText('Network timeout')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
  });

  it('renders custom title and handles close actions', () => {
    const onClose = jest.fn();
    const { getByText, UNSAFE_getByType } = render(
      <ApiErrorDialog
        visible
        title="Unauthorized"
        message="Please sign in again"
        onClose={onClose}
      />,
    );

    expect(getByText('Unauthorized')).toBeTruthy();
    fireEvent.press(getByText('OK'));
    expect(onClose).toHaveBeenCalledTimes(1);

    const modal = UNSAFE_getByType(Modal);
    modal.props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not render content when hidden', () => {
    const { queryByText } = render(
      <ApiErrorDialog visible={false} message="Server error" onClose={jest.fn()} />,
    );

    expect(queryByText('Server error')).toBeNull();
  });
});
