'use client';

import React, { useRef, useState } from 'react';
import {
    Button,
    ButtonGroup,
    ClickAwayListener,
    Fade,
    Paper,
    Popper,
    MenuItem,
    MenuList,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';

/**
 * SplitButton - A reusable MUI Split Button component
 */
const SplitButton = ({
    options = [],
    selectedValue,
    onSelect,
    onClick,
    variant = 'contained',
    size = 'small',
    disabled = false,
    className = '',
}) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === selectedValue) || options[0];

    const handleToggle = (e) => {
        e.stopPropagation();
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleMenuItemClick = (option) => {
        if (onSelect) {
            onSelect(option);
        }
        setOpen(false);
    };

    const handleMainClick = () => {
        if (onClick) {
            onClick(selectedOption);
        }
    };

    return (
        <>
            <ButtonGroup
                variant={variant}
                ref={anchorRef}
                className={className}
                disabled={disabled}
                size={size}
                disableElevation
                sx={{
                    '& .MuiButtonGroup-grouped:not(:last-of-type)': {
                        borderColor: 'rgba(255,255,255,0.4)',
                    },
                }}
            >
                <Button
                    onClick={handleMainClick}
                    sx={{
                        textTransform: 'none',
                        fontSize: '13px',
                        fontWeight: 400,
                        px: 1.5,
                        py: 0.5,
                        minHeight: '28px',
                    }}
                >
                    {selectedOption?.label || 'Select'}
                </Button>
                <Button
                    onClick={handleToggle}
                    sx={{
                        px: 0.5,
                        minWidth: '24px !important',
                        minHeight: '28px',
                    }}
                >
                    <ChevronDown size={14} />
                </Button>
            </ButtonGroup>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-end"
                transition
                sx={{ zIndex: 1400 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                        <Paper elevation={8} sx={{ mt: 0.5, minWidth: 130 }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList dense sx={{ py: 0.5 }}>
                                    {options.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            onClick={() => handleMenuItemClick(option)}
                                            sx={{
                                                fontSize: '13px',
                                                py: 0.75,
                                                px: 2,
                                                '&:hover': {
                                                    backgroundColor: '#f3f3f3',
                                                },
                                            }}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </>
    );
};

export default SplitButton;
