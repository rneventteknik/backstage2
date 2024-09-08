import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNotifications } from '../../lib/useNotifications';
import styles from './FileUploader.module.scss';

type Props<T> = {
    label: string;
    onFileUpload: (fileContent: T) => void;
};

const FileUploader = <T,>({ onFileUpload, label }: Props<T>): React.ReactElement => {
    const { showErrorMessage, showGeneralSuccessMessage } = useNotifications();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            acceptedFiles.forEach((file) => {
                const reader = new FileReader();

                reader.onabort = () => showErrorMessage('Uppladdning avbruten');
                reader.onerror = () => showErrorMessage('Filen kunde inte laddas upp');
                reader.onload = () => {
                    const fileContent = reader.result as string;

                    try {
                        const parsedFile = JSON.parse(fileContent);
                        onFileUpload(parsedFile);
                        showGeneralSuccessMessage('Filen laddades upp!');
                    } catch (error) {
                        console.error(error);
                        showErrorMessage('Filen kunde inte läsas');
                    }
                };
                reader.readAsText(file);
            });
        },
        [onFileUpload, showErrorMessage, showGeneralSuccessMessage],
    );
    const { getRootProps, getInputProps, isDragAccept } = useDropzone({ onDrop });

    return (
        <div
            {...getRootProps()}
            className={
                styles.fileUploaderArea +
                ' my-3 p-5 text-center align-middle ' +
                (isDragAccept ? styles.isDragAccept : '')
            }
        >
            <input {...getInputProps()} />
            <p className="m-0">{label}</p>
        </div>
    );
};

export default FileUploader;
