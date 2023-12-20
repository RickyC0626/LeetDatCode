import React, { useState } from 'react';
import ModalContainer from 'src/components/modal/ModalContainer';

const CustomButtonModal = ({ button, buttonStyle, modalContents, testid }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={buttonStyle} data-testid={testid} onClick={() => setOpen(!open)}>
        {button}
      </div>
      <ModalContainer open={open} setOpen={setOpen}>
        {modalContents}
      </ModalContainer>
    </>
  );
};

export default CustomButtonModal;
