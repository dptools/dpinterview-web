// Referece:
import Box from '@mui/material/Box';
import {DataGrid, DataGridProps} from '@mui/x-data-grid';
// https://mui.com/x/react-data-grid/
import * as React from 'react';


export interface MuiDataGridProps extends DataGridProps {
    pageSizeOptions: number[];
    height?: number;
    selectable?: boolean;
}

MuiDataGrid.defaultProps = {
    height: 400,
    selectable: false,
};

export default function MuiDataGrid({
                                        height = 400,
                                        selectable = false,
                                        ...props
                                    }: MuiDataGridProps) {
    // const [mounted, setMounted] = React.useState(false);
    const gridProps: Omit<MuiDataGridProps, "height" | "selectable"> = props;

    // React.useEffect(() => {
    //     setMounted(true);
    // }, []);
    //
    // if (!mounted) {
    //     return null;
    // }

    return (
        <Box sx={{height: height, width: '100%'}}>
            <DataGrid {...gridProps} checkboxSelection={selectable}
                      initialState={{
                          pagination: {
                              paginationModel: {
                                  pageSize: props.pageSizeOptions[0],
                              },
                          },
                      }}
            />
        </Box>
    );
}
