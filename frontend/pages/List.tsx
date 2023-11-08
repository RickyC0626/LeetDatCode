import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import ButtonModal from '../components/modal/ButtonModal';
import ErrorModal from '../components/modal/ErrorModal';
import QuestionList from '../components/QuestionList';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import useAuth from '../hooks/useAuth';
import useOverflow from '../hooks/useOverflow';
import modalStyles from '../styles/components/modal/Modal.module.css';
import styles from '../styles/pages/List.module.css';
import { formatDate } from '../utils/utils';
import Error from './Error';
import NotFound from './NotFound';

const DeleteListModal = ({ setError, toggleOpen }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const deleteList = async () => {
    try {
      await axiosPrivate.delete(`/api/list/${id}`);
      navigate('/my-lists');
    } catch (err) {
      setError(true);
      toggleOpen();
    }
  };

  return (
    <div className={modalStyles.modal}>
      <h2>Delete list?</h2>
      <p>This list will be permanently deleted. This action cannot be undone.</p>
      <div className={modalStyles['modal__footer']}>
        <button
          className={modalStyles.button}
          onClick={async () => {
            await deleteList();
          }}
        >
          Delete
        </button>
        <button className={modalStyles.button} onClick={toggleOpen}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const List = () => {
  const { id } = useParams();
  const { auth } = useAuth();

  const navigate = useNavigate();

  const [noPrivateAccess, setNoPrivateAccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  const [list, setList] = useState<any>({});
  const [questions, setQuestions] = useState<any[]>([]);

  const [displayEditMenu, setDisplayEditMenu] = useState(false);
  const [privateList, setPrivateList] = useState();

  const [overflow, textElementRef] = useOverflow();

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    setDisplayEditMenu(auth.username == list.username);
  }, [list]);

  const updateList = async (value: boolean) => {
    try {
      list.private = value;
      await axiosPrivate.put(`/api/list/${id}`, { ...list });
    } catch (err) {
      setError(true);
    }
  };

  const fetchList = async () => {
    try {
      const res = await axiosPrivate.get(`/api/list/${id}`);
      setList(res.data.questionList);
      setPrivateList(res.data.questionList.private);
      setQuestions(res.data.questions);
    } catch (err: any) {
      const status = err.response.status;
      switch (status) {
        case 403:
          setNoPrivateAccess(true);
          break;
        case 404:
          setNotFound(true);
          break;
        default:
      }
    }
  };

  const handleEdit = () => {
    navigate('/', { state: { ...list, questions } });
  };

  return (
    <>
      <ErrorModal open={error} setOpen={setError} />
      {noPrivateAccess && (
        <Error
          title={'403 Forbidden'}
          message={'You do not have access to view this private list.'}
          buttonText={'Back to lists'}
          path={'/lists'}
        />
      )}
      {notFound && <NotFound />}
      {!noPrivateAccess && !notFound && (
        <div className={styles.list}>
          <div className={styles['list__wrapper']}>
            <div className={styles['list__name']}>
              <h1
                className='truncate'
                ref={textElementRef}
                title={overflow ? list.name : undefined}
              >
                {list.name}
              </h1>
            </div>
            <div className={styles['list__info']}>
              <span>{list.username}</span>
              <span>{formatDate(list.createdAt)}</span>
            </div>
            {displayEditMenu ? (
              <div className={styles['list__edit-menu']}>
                <ToggleSwitch
                  style={styles['toggle-switch']}
                  height={20}
                  value={privateList}
                  setValue={setPrivateList}
                  label='private list'
                  onChange={updateList}
                />
                <button className={styles.button} onClick={handleEdit}>
                  Edit
                </button>
                <ButtonModal style={styles.button} text={'Delete'}>
                  <DeleteListModal setError={setError} />
                </ButtonModal>
              </div>
            ) : (
              <></>
            )}
            <QuestionList questions={questions} />
          </div>
        </div>
      )}
    </>
  );
};

export default List;
