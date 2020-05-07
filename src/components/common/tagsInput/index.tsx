import { escapeRegExp } from 'lodash';
import React, { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import styles from './TagsInput.module.scss';

interface ITagsInputProps {
  tags?: string[];
  suggestions?: string[];
  delimiter?: string;
  uniqueTags?: boolean;
  caseInsensitive?: boolean;
  onChange?: (tags: string[]) => void;
  minLength?: number;
}

export default ({
  tags,
  suggestions = [],
  delimiter = ',',
  uniqueTags = true,
  caseInsensitive = true,
  onChange,
  minLength = 1,
}: ITagsInputProps) => {
  const [currentTags, setCurrentTags] = useState(tags || []);
  const [currentInput, setCurrentInput] = useState('');
  const [matchingSuggestions, setMatchingSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const doSetCurrentTags = useCallback(
    (newTags: string[]) => {
      setCurrentTags([...newTags]);
      if (onChange) {
        onChange([...newTags]);
      }
    },
    [onChange],
  );

  const addTag = useCallback(
    (newTag) => {
      doSetCurrentTags([...currentTags, newTag]);
      setCurrentInput('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [currentTags, doSetCurrentTags],
  );

  const onInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(ev.target.value);
  }, []);

  const onInputKeyDown = useCallback(
    (ev: KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === delimiter) {
        ev.preventDefault();
        if (
          !uniqueTags ||
          !currentTags
            .map((t) => (caseInsensitive ? t.toLowerCase() : t))
            .includes(caseInsensitive ? currentInput.toLowerCase() : currentInput)
        ) {
          doSetCurrentTags([...currentTags, currentInput]);
        }
        setCurrentInput('');
      }
    },
    [caseInsensitive, currentInput, currentTags, delimiter, uniqueTags, doSetCurrentTags],
  );

  useEffect(() => {
    setCurrentTags(tags || []);
  }, [tags]);

  useEffect(() => {
    const updateSuggestionsTimeout = setTimeout(() => {
      if (currentInput.length >= minLength) {
        setMatchingSuggestions([...suggestions.filter((s) => s.includes(currentInput))]);
      } else {
        setMatchingSuggestions([]);
      }
    }, 200);

    return () => {
      clearTimeout(updateSuggestionsTimeout);
    };
  }, [currentInput, minLength, suggestions]);

  const dropdownMenuClases = [styles['dropdown-content']];
  if (matchingSuggestions.length > 0) {
    dropdownMenuClases.push(styles['dropdown-content-showing']);
  }

  const matchingRegExp = new RegExp(
    `(${escapeRegExp(currentInput)})`,
    caseInsensitive ? 'gi' : 'g',
  );
  const normalizedCurrentTags = currentTags.map((t) => (caseInsensitive ? t.toLowerCase() : t));

  return (
    <div className={styles['tags-input']}>
      {currentTags.map((t, i) => (
        <span key={i}>
          {t}{' '}
          <i
            onClick={() => {
              const newTags = [...currentTags];
              newTags.splice(i, 1);
              doSetCurrentTags(newTags);
            }}
          >
            ×
          </i>
        </span>
      ))}
      <input
        value={currentInput}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        ref={inputRef}
      />
      <ul className={dropdownMenuClases.join(' ')}>
        {matchingSuggestions.map((s) => {
          const disabled = uniqueTags && normalizedCurrentTags.includes(s);

          return (
            <li
              key={s}
              className={disabled ? styles['disabled-option'] : ''}
              onClick={() => {
                if (!disabled) {
                  addTag(s);
                }
              }}
              dangerouslySetInnerHTML={{ __html: s.replace(matchingRegExp, `<b>$1</b>`) }}
            />
          );
        })}
      </ul>
    </div>
  );
};
