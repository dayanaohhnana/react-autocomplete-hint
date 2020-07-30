import React, {
    useState,
    cloneElement,
    useEffect,
    useRef,
    ReactElement
} from 'react';
import { mergeRefs, interpolateStyle } from './utils';

export interface IHintProps {
    options: Array<string>;
    disableHint?: boolean;
}

export const Hint: React.FC<IHintProps> = props => {
    const {
        options,
        children: child,
        disableHint
    } = props;

    const childProps = (child as ReactElement).props;

    let mainInputRef = useRef<HTMLInputElement>(null);
    let hintRef = useRef<HTMLInputElement>(null);
    const [hint, setHint] = useState('');

    useEffect(() => {
        if (disableHint) {
            return;
        }

        const inputStyle = window.getComputedStyle(mainInputRef.current);

        hintRef.current.style.fontSize = inputStyle.fontSize;
        hintRef.current.style.height = inputStyle.height;
        hintRef.current.style.lineHeight = inputStyle.lineHeight;
        hintRef.current.style.boxSizing = inputStyle.boxSizing;
        hintRef.current.style.margin = interpolateStyle(inputStyle, 'margin');
        hintRef.current.style.padding = interpolateStyle(inputStyle, 'padding');
        hintRef.current.style.borderStyle = interpolateStyle(inputStyle, 'border', 'style');
        hintRef.current.style.borderWidth = interpolateStyle(inputStyle, 'border', 'width');
    });

    const getHint = (text: string) => {
        if (!text || text === '') {
            return '';
        }

        const match = options.filter(x => x !== text && x.startsWith(text)).sort()[0];
        return match || '';
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHint(getHint(e.target.value));
        childProps.onChange && childProps.onChange(e);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setHint('');
        childProps.onBlur && childProps.onBlur(e);
    };

    const RIGHT = 39;
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === RIGHT) {
            // For selectable input types ("text", "search"), only select the hint if
            // it's at the end of the input value. For non-selectable types ("email",
            // "number"), always select the hint.

            const isNonSelectableType = e.currentTarget.selectionEnd == null;
            const cursorIsAtTextEnd = isNonSelectableType
                ? true
                : e.currentTarget.selectionEnd === e.currentTarget.value.length

            if (cursorIsAtTextEnd && hint !== '' && e.currentTarget.value !== hint) {
                e.currentTarget.value = hint;
                childProps.onChange(e);
                setHint('');
            }
        }
        childProps.onKeyDown && childProps.onKeyDown(e);
    };

    const mainInput = cloneElement(
        child as any,
        {
            ...childProps,
            onChange,
            onBlur,
            onKeyDown,
            ref: mergeRefs(childProps.ref, mainInputRef)
        }
    );

    return (
        <div
            className="rah-input-wrapper"
            style={{ position: 'relative' }}>
            {
                disableHint
                    ? child
                    : (
                        <>
                            {mainInput}
                            <input
                                className="rah-input-hint"
                                defaultValue={hint}
                                ref={hintRef}
                                style={{
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                    boxShadow: 'none',
                                    color: 'rgba(0, 0, 0, 0.35)',
                                    pointerEvents: 'none',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%'
                                }}
                                tabIndex={-1}
                            />
                        </>
                    )
            }
        </div>
    );
}