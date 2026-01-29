import { useGetRepoBranches } from "@/api-client";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBranch } from "@/store/repoSlice";
import SelectDropdown from "../reusables/SelectDropdown";

const BranchList = ({ }) => {
    const { selectedRepo, selectedBranch } = useSelector((state) => state.repo);
    const { data: fetchedBranches, isLoading: branchesLoading, error: branchesError } = useGetRepoBranches(selectedRepo.id, { query: { enabled: !!selectedRepo.name, queryKey: ['branches', selectedRepo?.id] } });
    const branches = useMemo(() => fetchedBranches?.data?.data || [], [fetchedBranches]);
    const dispatch = useDispatch();
    const branchOptions = useMemo(() => {
        if (branchesError) {
            return [{ value: '', label: 'Error loading branches', disabled: true }];
        }
        if (branches.length === 0) {
            return [{ value: '', label: 'No branches available', disabled: true }];
        } 

        return branches?.map(branch => ({
            value: branch?.name,
            label: branch?.name
        }));
    }, [branches, branchesError]);

    const onBranchSelect = (branchDetails) => {
        dispatch(setSelectedBranch(branchDetails?.value));
    }


    return (
        <div className="border rounded-md shadow-sm">
            
            <SelectDropdown
                key={"branch-select"}
                options={branchesLoading ? [{ value: '', label: 'Loading...', disabled: true }] : branchOptions}
                value={branchesLoading ? '' : (selectedBranch || "")}
                placeholder={
                    branchesLoading ? "Loading branches..." :
                        branchesError ? "Error loading branches" :
                            fetchedBranches.length === 0 ? "No branches found" :
                                "Select branch"
                }
                className="text-sm z-[9999]"
                onChange={onBranchSelect}
                disabled={branchesLoading || fetchedBranches?.length === 0 || branchesError}
            />
        </div>
    );
};

export default BranchList;