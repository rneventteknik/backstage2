const mockRouterPushFn = jest.fn();

const mockRouter = {
    push: mockRouterPushFn,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRouter: (): any => ({
        push: mockRouterPushFn,
        asPath: 'fake-path',
    }),
};

export { mockRouter, mockRouterPushFn };
